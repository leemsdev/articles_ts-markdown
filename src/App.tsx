import { useState } from 'react';
import './App.css';
import { tokenize, tokensToStr } from './transpiler/tokens';

function App() {
	const [output, setOutput] = useState("")

	function onSourceChange(src: string) {
		let parsed = tokensToStr(tokenize(src))
		setOutput(parsed)
	}

	return (
		<div className="App">
			<textarea className="src" onChange={e => onSourceChange(e.target.value)} />
			<div className="output">
				<pre>{output}</pre>
			</div>
		</div>
	);
}

export default App;
