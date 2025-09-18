export const findStatus = (all_status: Array<String | undefined>) => {
  const [a, b] = all_status;

  if ((a && !b) || (!a && b)) {
    return "pending";
  } else if (a === "failed" || b === "failed") {
    return "fialed";
  } else {
    return "passed";
  }
};

export const getDuration = (all_duration: Array<number | undefined>) => {
  const [a, b] = all_duration;
  if (a && b) {
    return ((a + b) / 2000).toFixed(1) + "s";
  } else {
    return "-";
  }
};
