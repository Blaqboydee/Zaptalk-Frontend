export const formatTime = (timestamp) => {
  const now = new Date();
  const messageDate = new Date(timestamp);
  return (now - messageDate) / (1000 * 60 * 60) < 24
    ? messageDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    : messageDate.toLocaleDateString();
};