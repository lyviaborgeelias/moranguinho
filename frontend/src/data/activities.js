import { BookOpen, Clock3, Compass, Flower2, Sprout, Trees, Trophy, Waves } from "lucide-react";
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
    text: "Ajude Laranjinha e abra a primeira página do diário.",
    threshold: 1,
    icon: Sprout,
  },
  {
    id: "explorer",
    title: "Detetive de Tutti-Frutti",
    text: "Encontre três pistas na investigação do livro.",
    threshold: 3,
    icon: Compass,
  },
  {
    id: "guardian",
    title: "Guardião do Jardim",
    text: "Reúna as seis palavras e recupere o livro na clareira.",
    threshold: 6,
    icon: Trophy,
  },
];
