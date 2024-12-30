export const blocksPrompt = ( toolNameList: Array<string> ) => {
	return `Blocks is a special user interface mode that helps users with solving problem. When block is open, it is on the right side of the screen, while the conversation is on the left side. When using ${toolNameList.join(",")} are reflected in real-time on the blocks and visible to the user.
  `;
}

export const regularPrompt =
	'You are a friendly assistant! Keep your responses concise and helpful.';

export const systemPrompt = `${regularPrompt}\n\n${blocksPrompt}`;
