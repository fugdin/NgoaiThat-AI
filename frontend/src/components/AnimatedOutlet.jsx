import { useLocation, useOutlet } from "react-router-dom";

function AnimatedOutlet() {
  const element = useOutlet();
  const location = useLocation();

  if (!element) {
    return null;
  }

  return (
    <div key={location.pathname} className="page-transition">
      {element}
    </div>
  );
}

export default AnimatedOutlet;
