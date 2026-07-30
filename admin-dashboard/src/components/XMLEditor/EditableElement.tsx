import { useState } from 'react';
import FormattingToolbar from './FormattingToolbar';

interface EditableElementProps {
  type: 'heading' | 'paragraph' | 'pull_quote' | 'blockquote' | 'list' | 'image';
  content: any;
  onChange: (newContent: any) => void;
  onDelete: () => void;
}

export default function EditableElement({
  type,
  content,
  onChange,
  onDelete,
}: EditableElementProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(
    typeof content === 'string' ? content : content?._ || ''
  );

  const handleSave = () => {
    onChange({ ...content, _: editValue });
    setIsEditing(false);
  };

  const renderPreview = () => {
    switch (type) {
      case 'heading':
        return <h2 className="text-xl font-bold">{editValue}</h2>;
      case 'paragraph':
        return <p className="text-base">{editValue}</p>;
      case 'pull_quote':
        return (
          <blockquote className="border-l-4 border-blue-500 pl-4 italic">
            {editValue}
          </blockquote>
        );
      case 'blockquote':
        return (
          <blockquote className="border-l-4 border-gray-400 pl-4">
            {editValue}
          </blockquote>
        );
      default:
        return <p>{editValue}</p>;
    }
  };

  return (
    <div className="mb-4 p-4 border border-gray-300 rounded-lg hover:border-blue-500">
      {isEditing ? (
        <div className="space-y-3">
          <FormattingToolbar
            onBold={() => setEditValue(`<b>${editValue}</b>`)}
            onItalic={() => setEditValue(`<i>${editValue}</i>`)}
            onLink={() => setEditValue(`<a href="#">${editValue}</a>`)}
          />
          <textarea
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            className="w-full p-2 border rounded font-mono text-sm"
            rows={5}
          />
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
            >
              Save
            </button>
            <button
              onClick={() => setIsEditing(false)}
              className="bg-gray-400 text-white px-3 py-1 rounded hover:bg-gray-500"
            >
              Cancel
            </button>
            <button
              onClick={onDelete}
              className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 ml-auto"
            >
              Delete
            </button>
          </div>
        </div>
      ) : (
        <div
          onClick={() => setIsEditing(true)}
          className="cursor-pointer hover:opacity-75"
        >
          {renderPreview()}
        </div>
      )}
    </div>
  );
}
