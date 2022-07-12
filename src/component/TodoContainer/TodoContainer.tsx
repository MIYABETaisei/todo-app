import React, { useState } from "react";
import {
  DndContext,
  DragOverlay,
  closestCorners,
  DragOverEvent,
  DragStartEvent,
  UniqueIdentifier,
  useSensors,
  useSensor,
  PointerSensor,
  KeyboardSensor,
  DragEndEvent,
} from "@dnd-kit/core";
import { arrayMove, sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { TodoList } from "../TodoList";
import { AddTodo } from "../Addtodo";
import { TodoItem } from "../TodoItem";

type Props = {
  [key: string]: {
    id: UniqueIdentifier;
    title: string;
    date: Date | undefined;
    color: string;
  }[];
};

export const TodoContainer = () => {
  const [activeId, setActiveId] = useState<UniqueIdentifier | null>();
  const [items, setItems] = useState<Props>({
    todo: [],
    doing: [],
    done: [],
  });

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );
  return (
    <div className="flex justify-between max-w-6xl mx-auto px-3 mt-10">
      <AddTodo setItems={setItems} />
      <div className="flex justify-between w-[calc(80%-20px)] border-2 border-black rounded-xl py-1 px-[9px]">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          <TodoList label="Todo" id="todo" items={items.todo} />
          <TodoList label="Doing" id="doing" items={items.doing} />
          <TodoList label="Done" id="done" items={items.done} />
          <DragOverlay>
            {activeId ? (
              <TodoItem
                id={activeId}
                title={findId(activeId)?.title}
                date={findId(activeId)?.date}
                color={findId(activeId)?.color}
              />
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>
    </div>
  );

  function findId(id: UniqueIdentifier) {
    const array = Object.keys(items);
    for (const x of array) {
      return items[x].find((item) => item.id === id);
    }
    return null;
  }
  function findContainer(id: UniqueIdentifier) {
    if (id in items) {
      return id;
    }
    const array = Object.keys(items);
    for (const x of array) {
      if (items[x].find((item) => item.id === id)) {
        return x;
      }
    }
  }
  function handleDragStart(event: DragStartEvent) {
    const { active } = event;
    const { id } = active;

    setActiveId(id);
  }

  function handleDragOver(event: DragOverEvent) {
    const { active, over } = event;
    const { id } = active;
    if (!over) {
      return;
    }
    const { id: overId } = over;

    // Find the containers
    // todo,doing,doneのいずれかを持つ
    const activeContainer = findContainer(id);
    const overContainer = findContainer(overId);

    if (
      !activeContainer ||
      !overContainer ||
      activeContainer === overContainer
    ) {
      return;
    }

    setItems((prev) => {
      // 移動元のコンテナの要素配列を取得
      const activeItems = prev[activeContainer];

      // 移動先のコンテナの要素配列を取得
      const overItems = prev[overContainer];

      // Find the indexes for the items
      const activeIndex = items[activeContainer].findIndex(
        (item) => item.id === active.id
      );
      const overIndex = items[overContainer].findIndex(
        (item) => item.id === overId
      );

      let newIndex;
      if (overId in prev) {
        // We're at the root droppable of a container
        newIndex = overItems.length + 1;
      } else {
        const isBelowLastItem = over && overIndex === overItems.length - 1;

        const modifier = isBelowLastItem ? 1 : 0;

        newIndex = overIndex >= 0 ? overIndex + modifier : overItems.length + 1;
      }

      return {
        ...prev,
        [activeContainer]: [
          ...prev[activeContainer].filter((item) => item.id !== active.id),
        ],
        [overContainer]: [
          ...prev[overContainer].slice(0, newIndex),
          items[activeContainer][activeIndex],
          ...prev[overContainer].slice(newIndex, prev[overContainer].length),
        ],
      };
    });
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    const { id } = active;
    if (!over) {
      return;
    }
    const { id: overId } = over;

    const activeContainer = findContainer(id);
    const overContainer = findContainer(overId);

    if (
      !activeContainer ||
      !overContainer ||
      activeContainer !== overContainer
    ) {
      return;
    }
    const activeIndex = items[activeContainer].findIndex(
      (item) => item.id === active.id
    );
    const overIndex = items[overContainer].findIndex(
      (item) => item.id === overId
    );

    if (activeIndex !== overIndex) {
      setItems((items) => ({
        ...items,
        [overContainer]: arrayMove(
          items[overContainer],
          activeIndex,
          overIndex
        ),
      }));
    }

    setActiveId(null);
  }
};
