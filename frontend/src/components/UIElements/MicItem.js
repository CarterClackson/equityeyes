import React from 'react';
import { useDrag } from 'react-dnd';

const MicItem = ({ mic, onDrop }) => {
	const [{ isDragging }, drag, preview] = useDrag({
		type: 'market',
		item: { mic },
	});

	return (
		<>
			{preview(
				<li
					ref={drag}
					className={`bg-emerald-900 text-zinc-50 rounded-lg py-2 px-16 mt-1 text-center cursor-move w-full box-border sm:w-1/4 sm:px-12 sm:flex sm:justify-center`}
					style={{
						opacity: isDragging ? 0.5 : 1,
						transition: 'opacity 0.2s ease-in-out',
					}}
				>
					{mic}
				</li>
			)}
		</>
	);
};

export default MicItem;
