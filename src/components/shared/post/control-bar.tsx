import {
  AiOutlineHeart,
  AiOutlineMessage,
  AiOutlineSend,
} from "react-icons/ai";

function ControlBar() {
  return (
    <div className="flex items-center gap-2">
      <div className="cursor-pointer hover:opacity-60">
        <AiOutlineHeart className="h-7 w-7" />
      </div>
      <div className="cursor-pointer hover:opacity-60">
        <AiOutlineMessage className="h-6 w-6" />
      </div>
      <div className="cursor-pointer hover:opacity-60">
        <AiOutlineSend className="h-6 w-6" />
      </div>
    </div>
  );
}

export default ControlBar;
