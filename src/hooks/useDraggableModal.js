import { useRef } from 'react';

export function useDraggableModal() {
  const dragState = useRef({ isDragging: false, offsetX: 0, offsetY: 0 });

  const handleHeaderMouseDown = (e) => {
    if (e.target.closest('button, .btn-close')) return;
    
    const modal = e.currentTarget.closest('.modal-dialog');

    modal.style.maxWidth = "1600px";
    modal.style.width = "1000px";
    
    const rect = modal.getBoundingClientRect();
    
    dragState.current = {
      isDragging: true,
      offsetX: e.clientX - rect.left,
      offsetY: e.clientY - rect.top,
      modal
    };
  };

  const handleMouseMove = (e) => {
    if (!dragState.current.isDragging) return;
    
    const { modal, offsetX, offsetY } = dragState.current;
    
    modal.style.position = 'fixed';
    modal.style.left = `${e.clientX - offsetX}px`;
    modal.style.top = `${e.clientY - offsetY}px`;
    modal.style.margin = '0';
    modal.style.transform = 'none';
  };

  const handleMouseUp = () => {
    dragState.current.isDragging = false;
  };

  return {
    handleHeaderMouseDown,
    handleMouseMove,
    handleMouseUp,
  };
}