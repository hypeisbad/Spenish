import { Empty } from '../components/ui';

export default function NotFound() {
  return (
    <div className="page narrow">
      <Empty emoji="🌵" title="¡Híjole! Esta página no existe.">
        <p>That page doesn’t exist.</p>
        <a className="btn primary" href="#/">Regresar al inicio</a>
      </Empty>
    </div>
  );
}
