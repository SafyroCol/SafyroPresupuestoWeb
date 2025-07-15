export default function EvidenciaUploader({ onUpload, multiple }) {
  return (
    <input
      type="file"
      accept=".pdf,image/*"
      multiple={multiple}
      onChange={e => onUpload([...e.target.files])}
      className="block w-full"
    />
  );
}
