"use client";
import animData from "./assets/anim/clock.json";
import {lazy} from "react";

const LazyLottieComponent = lazy(() => import('react-lottie'));

interface Props {
  width: number;
  height: number;
}
export const LoadingClock = ({ width, height }: Props) => (
  <LazyLottieComponent
    options={{
      loop: true,
      autoplay: true,
      animationData: animData,
    }}
    width={width}
    height={height}
  />
);
