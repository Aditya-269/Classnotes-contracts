// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/// @title ClassNotes - Simple Notes Storage Contract
/// @notice Anyone can add notes; only the author can delete their note.
/// @dev No constructor inputs during deployment.
contract ClassNotes {

    // A note structure
    struct Note {
        address author;      // person who added the note
        string content;      // the note text
        uint256 timestamp;   // when it was added
    }

    // Dynamic array of all notes
    Note[] public notes;

    // Event logs
    event NoteAdded(address indexed author, string content, uint256 timestamp);
    event NoteDeleted(address indexed author, uint256 index);

    // ---------------------------------------------------------
    // ADD A NEW NOTE
    // ---------------------------------------------------------
    function addNote(string calldata _content) external {
        require(bytes(_content).length > 0, "Note cannot be empty");

        notes.push(
            Note({
                author: msg.sender,
                content: _content,
                timestamp: block.timestamp
            })
        );

        emit NoteAdded(msg.sender, _content, block.timestamp);
    }

    // ---------------------------------------------------------
    // DELETE A NOTE YOU CREATED
    // ---------------------------------------------------------
    function deleteNote(uint256 index) external {
        require(index < notes.length, "Index out of range");
        require(notes[index].author == msg.sender, "You can delete only your notes");

        // Move last note to deleted slot (efficient deletion)
        notes[index] = notes[notes.length - 1];
        notes.pop();

        emit NoteDeleted(msg.sender, index);
    }

    // ---------------------------------------------------------
    // GET TOTAL NOTES COUNT
    // ---------------------------------------------------------
    function getNotesCount() external view returns (uint256) {
        return notes.length;
    }
}
