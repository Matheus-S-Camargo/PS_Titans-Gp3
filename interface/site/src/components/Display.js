export default function Display({ src }) {
  return (
    <div className="display">
      <video width="640" height="360" controls src={src}>
        Seu navegador não suporta a tag de vídeo.
      </video>
    </div>
  );
}