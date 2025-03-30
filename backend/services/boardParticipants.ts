interface Participant {
  userId: string;
  userName: string;
}

export class BoardManager {
  // Create a Map to store participants by boardId
  private participants: Map<string, Participant[]> = new Map();

  // Add a participant to a board
  public addParticipant(boardId: string, participant: Participant) {
    if (!this.participants.has(boardId)) {
      // If the board doesn't exist in the map, create a new entry
      this.participants.set(boardId, []);
    }

    // Add the participant to the board's list
    const boardParticipants = this.participants.get(boardId);
    if (boardParticipants && !this.isParticipant(boardId, participant.userId)) {
      // Check if the participant is already in the list
      boardParticipants.push(participant);
    }
  }

  // Remove a participant from a board
  public removeParticipant(boardId: string, userId: string) {
    const boardParticipants = this.participants.get(boardId);
    if (boardParticipants) {
      const updatedParticipants = boardParticipants.filter(
        (p) => p.userId !== userId
      );

      if (updatedParticipants.length === 0) {
        this.participants.delete(boardId);
      } else {
        this.participants.set(boardId, updatedParticipants);
      }
    }
  }

  // Get participants for a board
  public getParticipants(boardId: string): Participant[] | undefined {
    return this.participants.get(boardId);
  }

  // Check if a user is already a participant on the board
  private isParticipant(boardId: string, userId: string): boolean {
    const boardParticipants = this.participants.get(boardId);
    return (
      boardParticipants?.some((participant) => participant.userId === userId) ||
      false
    );
  }
}

// // Create a participant
// const participant: Participant = {
//   userId: "user123",
//   userName: "John Doe",
// };

// // Add the participant to a board
// boardManager.addParticipant("board1", participant);

// // Get all participants for a board
// console.log(boardManager.getParticipants("board1")); // Output: [{ userId: "user123", userName: "John Doe" }]

// // Check if a participant exists on a board
// console.log(boardManager.isParticipant("board1", "user123")); // Output: true

// // Remove a participant
// boardManager.removeParticipant("board1", "user123");

// // Check again after removal
// console.log(boardManager.getParticipants("board1")); // Output: []
