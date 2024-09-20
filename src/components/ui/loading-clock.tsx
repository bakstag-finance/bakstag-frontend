import { LottiePlayer, RendererType } from "lottie-web";
import * as React from "react";

interface Props {
  src: string;
  loop?: boolean;
  renderer?: RendererType;
  className?: string;
}

function Lotie({ src, loop, renderer, className }: Props): React.ReactNode {
  const ref = React.useRef<HTMLDivElement | null>(null);
  const [lottie, setLottie] = React.useState<LottiePlayer | null>(null);

  React.useEffect(() => {
    import("lottie-web").then((Lottie) => setLottie(Lottie.default));
  }, []);

  React.useEffect(() => {
    if (lottie && ref.current) {
      const animation = lottie.loadAnimation({
        container: ref.current,
        renderer: renderer || "svg",
        loop: loop,
        autoplay: true,
        path: src,
      });

      return () => animation.destroy();
    }
  }, [lottie]);

  return <div ref={ref} className={className}></div>;
}

export const LoadingClock = ({ className }: { className?: string }) => (
  <Lotie src={"./assets/anim/clock.json"} loop className={className} />
);
