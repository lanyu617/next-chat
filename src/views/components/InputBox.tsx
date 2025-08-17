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
    <div className="px-2 py-4 sm:px-4 bg-gray-200 flex w-full">
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
        className="flex-1 mr-2" // Added flex-1 and mr-2, removed inline style
      />
      <Button type="primary" onClick={handleSendMessage}>
        Send
      </Button>
    </div>
  );
}
