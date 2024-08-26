'use client'
import { motion } from 'framer-motion'

const MotionDiv = ({ children }) => (
	<motion.div
		style={{
			width: '100%',
			margin: 'auto',
			background:
				'linear-gradient(180deg, rgba(100,100,100,0.15) 0%, rgba(100,100,100,0.15) 40%, rgba(100,100,100,0.2) 50% , rgba(100,100,100,0.15) 60%, rgba(100,100,100,0.15) 100%)',
			height: '57vh',
			width: '400px',
			borderRadius: '10px',
			backgroundSize: '100% 300%',
			display: 'flex',
			flexDirection: 'column',
			flexWrap: 'nowrap',
			gap: '5px',
			padding: '25px 10px',
			alignItems: 'center',
			justifyContent: 'space-evenly',
			position: 'relative',
			maxHeight: '600px',
		}}
		animate={{
			backgroundPositionY: ['0%', '300%'],
		}}
		transition={{
			duration: 10,
			ease: 'linear',
			repeat: Infinity,
			repeatType: 'reverse',
			repeatDelay: 1,
		}}
	>
		{children}
	</motion.div>
)

export default MotionDiv
