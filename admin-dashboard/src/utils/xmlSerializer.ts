/**
 * Serialize article data to XML format
 */
export function serializeArticleToXML(article: any): string {
  const {
    id,
    metadata,
    content,
    media,
    tags,
  } = article;

  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += `<article id="${escapeXml(id)}" version="1.0" language="en">\n`;

  // Metadata section
  xml += '  <metadata>\n';
  xml += `    <title>${escapeXml(metadata.title)}</title>\n`;
  xml += `    <slug>${escapeXml(metadata.slug)}</slug>\n`;
  xml += `    <excerpt>${escapeXml(metadata.excerpt)}</excerpt>\n`;

  if (metadata.author) {
    xml += `    <author anonymous="${metadata.author.anonymous || 'true'}">\n`;
    if (metadata.author.name) {
      xml += `      <name>${escapeXml(metadata.author.name)}</name>\n`;
    }
    if (metadata.author.email) {
      xml += `      <email>${escapeXml(metadata.author.email)}</email>\n`;
    }
    xml += '    </author>\n';
  }

  xml += '    <issue>\n';
  xml += `      <issue_id>${escapeXml(metadata.issue.issue_id)}</issue_id>\n`;
  xml += `      <issue_number>${metadata.issue.issue_number}</issue_number>\n`;
  xml += `      <month>${escapeXml(metadata.issue.month)}</month>\n`;
  xml += `      <year>${metadata.issue.year}</year>\n`;
  xml += '    </issue>\n';

  xml += `    <publication_date>${metadata.publication_date}</publication_date>\n`;
  if (metadata.created_date) {
    xml += `    <created_date>${metadata.created_date}</created_date>\n`;
  }
  if (metadata.updated_date) {
    xml += `    <updated_date>${metadata.updated_date}</updated_date>\n`;
  }
  if (metadata.reading_time_minutes) {
    xml += `    <reading_time_minutes>${metadata.reading_time_minutes}</reading_time_minutes>\n`;
  }
  if (metadata.word_count) {
    xml += `    <word_count>${metadata.word_count}</word_count>\n`;
  }
  if (metadata.page_number) {
    xml += `    <page_number>${metadata.page_number}</page_number>\n`;
  }
  if (metadata.theme) {
    xml += `    <theme>${escapeXml(metadata.theme)}</theme>\n`;
  }

  xml += '  </metadata>\n';

  // Content section
  xml += '  <content>\n';
  if (Array.isArray(content)) {
    for (const element of content) {
      xml += serializeElement(element, 2);
    }
  } else {
    xml += serializeElement(content, 2);
  }
  xml += '  </content>\n';

  // Media section
  if (media) {
    xml += '  <media>\n';
    if (media.featured_image) {
      xml += serializeImage(media.featured_image, 3, 'featured_image');
    }
    if (media.additional_images) {
      xml += '    <additional_images>\n';
      for (const img of media.additional_images) {
        xml += serializeImage(img, 4, 'image');
      }
      xml += '    </additional_images>\n';
    }
    xml += '  </media>\n';
  }

  // Tags section
  if (tags && (tags.tag?.length || tags.categories?.length || tags.keywords?.length)) {
    xml += '  <tags>\n';
    if (tags.tag) {
      const tagList = Array.isArray(tags.tag) ? tags.tag : [tags.tag];
      for (const tag of tagList) {
        xml += `    <tag>${escapeXml(tag)}</tag>\n`;
      }
    }
    if (tags.categories) {
      xml += '    <categories>\n';
      const categories = Array.isArray(tags.categories) ? tags.categories : [tags.categories];
      for (const cat of categories) {
        xml += `      <category>${escapeXml(cat)}</category>\n`;
      }
      xml += '    </categories>\n';
    }
    if (tags.keywords) {
      xml += '    <keywords>\n';
      const keywords = Array.isArray(tags.keywords) ? tags.keywords : [tags.keywords];
      for (const kw of keywords) {
        xml += `      <keyword>${escapeXml(kw)}</keyword>\n`;
      }
      xml += '    </keywords>\n';
    }
    xml += '  </tags>\n';
  }

  xml += '</article>\n';
  return xml;
}

/**
 * Serialize single element
 */
function serializeElement(element: any, indent: number): string {
  const space = ' '.repeat(indent);
  let xml = '';

  if (typeof element === 'string') {
    return `${space}<paragraph>${escapeXml(element)}</paragraph>\n`;
  }

  if (element.heading) {
    const level = element.heading.level || 1;
    const text = element.heading._ || element.heading;
    xml += `${space}<heading level="${level}">${escapeXml(text)}</heading>\n`;
  } else if (element.subheading) {
    const level = element.subheading.level || 2;
    const text = element.subheading._ || element.subheading;
    xml += `${space}<subheading level="${level}">${escapeXml(text)}</subheading>\n`;
  } else if (element.paragraph) {
    const text = element.paragraph._ || element.paragraph;
    xml += `${space}<paragraph>${escapeXml(text)}</paragraph>\n`;
  } else if (element.pull_quote) {
    xml += `${space}<pull_quote>\n`;
    xml += `${space}  <quote>${escapeXml(element.pull_quote.quote)}</quote>\n`;
    if (element.pull_quote.attribution) {
      xml += `${space}  <attribution>${escapeXml(element.pull_quote.attribution)}</attribution>\n`;
    }
    xml += `${space}</pull_quote>\n`;
  } else if (element.blockquote) {
    const text = element.blockquote._ || element.blockquote;
    const source = element.blockquote.source ? ` source="${escapeXml(element.blockquote.source)}"` : '';
    xml += `${space}<blockquote${source}>${escapeXml(text)}</blockquote>\n`;
  } else if (element.list) {
    const type = element.list.type || 'unordered';
    xml += `${space}<list type="${type}">\n`;
    const items = Array.isArray(element.list.item) ? element.list.item : [element.list.item];
    for (const item of items) {
      xml += `${space}  <item>${escapeXml(typeof item === 'string' ? item : item._)}</item>\n`;
    }
    xml += `${space}</list>\n`;
  } else if (element.image_ref) {
    xml += `${space}<image_ref>\n`;
    xml += `${space}  <src>${element.image_ref.src}</src>\n`;
    xml += `${space}  <alt>${escapeXml(element.image_ref.alt)}</alt>\n`;
    if (element.image_ref.caption) {
      xml += `${space}  <caption>${escapeXml(element.image_ref.caption)}</caption>\n`;
    }
    if (element.image_ref.credit) {
      xml += `${space}  <credit>${escapeXml(element.image_ref.credit)}</credit>\n`;
    }
    xml += `${space}</image_ref>\n`;
  } else if (element.section) {
    xml += `${space}<section>\n`;
    if (element.section.title) {
      xml += `${space}  <title>${escapeXml(element.section.title)}</title>\n`;
    }
    // Serialize nested content
    xml += `${space}</section>\n`;
  }

  return xml;
}

/**
 * Serialize image element
 */
function serializeImage(image: any, indent: number, tagName: string): string {
  const space = ' '.repeat(indent);
  let xml = `${space}<${tagName}>\n`;
  xml += `${space}  <filename>${escapeXml(image.filename || '')}</filename>\n`;
  xml += `${space}  <src>${image.src}</src>\n`;
  xml += `${space}  <alt>${escapeXml(image.alt)}</alt>\n`;
  if (image.caption) {
    xml += `${space}  <caption>${escapeXml(image.caption)}</caption>\n`;
  }
  if (image.credit) {
    xml += `${space}  <credit>${escapeXml(image.credit)}</credit>\n`;
  }
  xml += `${space}</${tagName}>\n`;
  return xml;
}

/**
 * Escape special XML characters
 */
function escapeXml(text: string): string {
  if (!text) return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}
