import { useState } from 'react';
import './App.css';
import { tokenize } from './transpiler/tokens';
import { astToString, parse } from './transpiler/ast'
import emitHtml from './transpiler/emitter';

function App() {
	const [output, setOutput] = useState("")

	function onSourceChange(src: string) {
		let tokenized = tokenize(src)
		console.log(tokenized)
		let parsed = parse(tokenized)
		let html = emitHtml(parsed)

		setOutput(html)
	}

	return (
		<div className="App">
			<textarea className="src" onChange={e => onSourceChange(e.target.value)} />
			<div className='output' dangerouslySetInnerHTML={{ __html: output }} />
		</div>
	);
}

export default App;
