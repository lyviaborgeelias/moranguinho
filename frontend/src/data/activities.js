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
    text: "Descubra a primeira mensagem da Moranguinho.",
    threshold: 1,
    icon: Sprout,
  },
  {
    id: "explorer",
    title: "Olhar curioso",
    text: "Explore três cantinhos do jardim.",
    threshold: 3,
    icon: Compass,
  },
  {
    id: "guardian",
    title: "Amigo da Moranguinho",
    text: "Reúna todas as seis mensagens das amigas.",
    threshold: 6,
    icon: Trees,
  },
];
