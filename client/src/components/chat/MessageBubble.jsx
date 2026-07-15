const MessageBubble = ({ message }) => {
  return (
    <div className="message-bubble">
      {message.text}
    </div>
  );
};

export default MessageBubble;