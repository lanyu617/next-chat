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
    <div className="px-2 py-4 sm:px-4 bg-gray-200 w-full max-w-full overflow-hidden">
      <div className="flex flex-col sm:flex-row gap-2 w-full">
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
          className="flex-1 min-w-0 w-full sm:w-auto"
          style={{ resize: 'none' }}
        />
        <Button 
          type="primary" 
          onClick={handleSendMessage} 
          className="flex-shrink-0 self-end sm:self-auto w-auto px-4"
          size="middle"
        >
          Send
        </Button>
      </div>
    </div>
  );
}
