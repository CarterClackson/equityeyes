import React from 'react';
import { useDrop } from 'react-dnd';
import MicItem from './UIElements/MicItem';

const MarketList = ({ title, items, onDrop, setText }) => {
	const [{ isOver, canDrop }, drop] = useDrop({
		accept: 'market',
		drop: (item) => {
			const draggedMic = item.mic;

			// Check if the dragged item is not already in the list
			if (!items.includes(draggedMic)) {
				onDrop(draggedMic);
			}
		},
		collect: (monitor) => ({
			isOver: !!monitor.isOver(),
			canDrop: !!monitor.canDrop(),
		}),
	});

	return (
		<div
			ref={drop}
			className='border-1 border-black pt-0 pr-4 pl-4 pb-4 mr-4'
		>
			<h2 className='text-center text-base font-bold'>{title}</h2>
			<ul className='min-w-52 list-style-none p-0'>
				{items.map((mic) => (
					<MicItem
						key={mic}
						mic={mic}
					/>
				))}
			</ul>
			{isOver && canDrop && <div className='text-center'>Release to {setText}</div>}
		</div>
	);
};

export default MarketList;
