import { UniqueIdentifier } from "@dnd-kit/core";
import { FC } from "react";

type Props = {
  id: UniqueIdentifier;
  date: string;
};

/**@package */
export const TodoBlock: FC<Props> = (props) => {
  const { id, date } = props;

  return (
    <button className="text-md font-bold block border-2 border-gray-300 shadow-lg shadow-black/30 w-full p-2 rounded-md">
      {id}
      <span>{date}</span>
    </button>
  );
};
