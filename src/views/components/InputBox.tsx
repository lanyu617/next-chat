import { Button, Input } from 'antd';

interface InputBoxProps {
  input: string;
  setInput: (input: string) => void;
  handleSendMessage: () => void;
}

export default function InputBox({
  input,
  setInput,
  handleSendMessage,
}: InputBoxProps) {
  return (
    <div className="p-4 bg-gray-200 flex">
      <Input.TextArea
        placeholder="Type your message..."
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onPressEnter={(e) => {
          if (e.shiftKey) return; // Allow shift + enter for new line
          e.preventDefault(); // Prevent default new line
          handleSendMessage();
        }}
        autoSize={{ minRows: 1, maxRows: 5 }}
        style={{ marginRight: '8px' }}
      />
      <Button type="primary" onClick={handleSendMessage}>
        Send
      </Button>
    </div>
  );
}
