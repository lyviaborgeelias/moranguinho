import { BookOpen, Clock3, Compass, Flower2, Sprout, Trees, Waves } from "lucide-react";
export const destinationIcons = {
  sprout: Sprout,
  flower: Flower2,
  water: Waves,
  clock: Clock3,
  book: BookOpen,
  tree: Trees,
};
export const achievements = [
  {
    id: "first",
    title: "Primeiro passo",
    text: "Descubra o primeiro fragmento.",
    threshold: 1,
    icon: Sprout,
  },
  {
    id: "explorer",
    title: "Olhar curioso",
    text: "Explore três destinos do vale.",
    threshold: 3,
    icon: Compass,
  },
  {
    id: "guardian",
    title: "Guardião do vale",
    text: "Reúna todos os seis fragmentos.",
    threshold: 6,
    icon: Trees,
  },
];
