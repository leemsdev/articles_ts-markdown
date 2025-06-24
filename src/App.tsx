import { useState } from 'react';
import './App.css';

function App() {
	const [output, setOutput] = useState("")

	function onSourceChange(src: string) {
		setOutput(src)
	}

	return (
		<div className="App">
			<textarea className="src" onChange={e => onSourceChange(e.target.value)} />
			<div className="output">
				{output}
			</div>
		</div>
	);
}

export default App;
