interface FormattingToolbarProps {
  onBold: () => void;
  onItalic: () => void;
  onLink: () => void;
  onHeading?: () => void;
  onList?: () => void;
}

export default function FormattingToolbar({
  onBold,
  onItalic,
  onLink,
  onHeading,
  onList,
}: FormattingToolbarProps) {
  return (
    <div className="flex gap-1 bg-gray-100 p-2 rounded border">
      <button
        onClick={onBold}
        className="px-2 py-1 bg-white border rounded hover:bg-gray-50 font-bold"
        title="Bold"
      >
        B
      </button>
      <button
        onClick={onItalic}
        className="px-2 py-1 bg-white border rounded hover:bg-gray-50 italic"
        title="Italic"
      >
        I
      </button>
      <button
        onClick={onLink}
        className="px-2 py-1 bg-white border rounded hover:bg-gray-50 text-blue-600"
        title="Link"
      >
        🔗
      </button>

      <div className="border-l mx-1" />

      {onHeading && (
        <button
          onClick={onHeading}
          className="px-2 py-1 bg-white border rounded hover:bg-gray-50 text-sm"
          title="Heading"
        >
          H1
        </button>
      )}

      {onList && (
        <button
          onClick={onList}
          className="px-2 py-1 bg-white border rounded hover:bg-gray-50"
          title="List"
        >
          ☰
        </button>
      )}
    </div>
  );
}
