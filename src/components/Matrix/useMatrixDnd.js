import { useState, useRef } from 'react';
import {
  closestCorners,
  PointerSensor,
  TouchSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { arrayMove, sortableKeyboardCoordinates } from '@dnd-kit/sortable';

const QUADRANT_IDS = ['do-first', 'schedule', 'delegate', 'eliminate'];

const QUADRANT_MAPPING = {
  'do-first': { important: true, urgent: true },
  'schedule': { important: true, urgent: false },
  'delegate': { important: false, urgent: true },
  'eliminate': { important: false, urgent: false },
};

function findContainerInState(state, id) {
  if (QUADRANT_IDS.includes(id)) return id;
  return QUADRANT_IDS.find(qId => state[qId].some(t => t.id === id));
}

/**
 * drag-and-drop logic for the matrix.
 *
 * @param {Object}   options
 * @param {Object}   options.initialItems  – { 'do-first': [], 'schedule': [], … }
 * @param {Function} [options.onReorderComplete] – called with the final items after every drag end
 * @returns {{ items, setItems, activeTask, isDragging, sensors, collisionDetection, handleDragStart, handleDragOver, handleDragEnd }}
 */
export default function useMatrixDnd({ initialItems, onReorderComplete } = {}) {
  const [items, setItems] = useState(
    initialItems ?? { 'do-first': [], 'schedule': [], 'delegate': [], 'eliminate': [] }
  );
  const [activeTask, setActiveTask] = useState(null);
  const isDragging = useRef(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );


  const handleDragStart = (event) => {
    isDragging.current = true;
    const { active } = event;
    const container = findContainerInState(items, active.id);
    if (container) {
      setActiveTask(items[container].find(t => t.id === active.id));
    }
  };

  const handleDragOver = (event) => {
    const { active, over } = event;
    if (!over) return;

    setItems(prev => {
      const activeContainer = findContainerInState(prev, active.id);
      const overContainer = findContainerInState(prev, over.id);

      if (!activeContainer || !overContainer || activeContainer === overContainer) return prev;

      const activeItems = [...prev[activeContainer]];
      const overItems = [...prev[overContainer]];

      const activeIndex = activeItems.findIndex(t => t.id === active.id);
      if (activeIndex === -1) return prev;

      const [movedTask] = activeItems.splice(activeIndex, 1);
      const { important, urgent } = QUADRANT_MAPPING[overContainer];
      const updatedTask = { ...movedTask, important, urgent };

      let insertIndex;
      if (QUADRANT_IDS.includes(over.id)) {
        insertIndex = overItems.length;
      } else {
        const overIndex = overItems.findIndex(t => t.id === over.id);
        insertIndex = overIndex >= 0 ? overIndex : overItems.length;
      }
      overItems.splice(insertIndex, 0, updatedTask);

      return {
        ...prev,
        [activeContainer]: activeItems,
        [overContainer]: overItems,
      };
    });
  };

  // Within-container reorder + optional persistence callback (fires once on drop)
  const handleDragEnd = (event) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) {
      isDragging.current = false;
      return;
    }

    setItems(prev => {
      const activeContainer = findContainerInState(prev, active.id);
      const overContainer = findContainerInState(prev, over.id);

      if (!activeContainer || !overContainer || activeContainer !== overContainer) return prev;

      const containerItems = prev[activeContainer];
      const oldIndex = containerItems.findIndex(t => t.id === active.id);
      const newIndex = containerItems.findIndex(t => t.id === over.id);

      if (oldIndex === -1 || newIndex === -1 || oldIndex === newIndex) return prev;

      return {
        ...prev,
        [activeContainer]: arrayMove(containerItems, oldIndex, newIndex),
      };
    });

    if (onReorderComplete) {
      setTimeout(() => {
        setItems(currentItems => {
          Promise.resolve(onReorderComplete(currentItems))
            .finally(() => {
              isDragging.current = false;
            });
          return currentItems; 
        });
      }, 0);
    } else {
      isDragging.current = false;
    }
  };

  return {
    items,
    setItems,
    activeTask,
    isDragging,
    sensors,
    collisionDetection: closestCorners,
    handleDragStart,
    handleDragOver,
    handleDragEnd,
  };
}

export { QUADRANT_IDS, QUADRANT_MAPPING };
