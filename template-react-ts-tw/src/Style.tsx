import style from "./App.css?inline";

export const Style = () => {
  const key =
    import.meta.env.MODE === "development" ? Math.random() : undefined;

  return <style key={key}>{style}</style>;
};
