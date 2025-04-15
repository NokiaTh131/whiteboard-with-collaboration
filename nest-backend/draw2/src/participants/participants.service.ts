import { Injectable } from '@nestjs/common';

export interface Participant {
  userId: string;
  userName: string;
}

@Injectable()
export class ParticipantsService {
  private participants: Map<string, Participant[]> = new Map();

  public addParticipant(boardId: string, participant: Participant) {
    if (!this.participants.has(boardId)) {
      this.participants.set(boardId, []);
    }

    const boardParticipants = this.participants.get(boardId);
    if (boardParticipants && !this.isParticipant(boardId, participant.userId)) {
      boardParticipants.push(participant);
    }
  }

  public removeParticipant(boardId: string, userId: string) {
    const boardParticipants = this.participants.get(boardId);
    if (boardParticipants) {
      const updatedParticipants = boardParticipants.filter(
        (p) => p.userId !== userId,
      );
      if (updatedParticipants.length === 0) {
        this.participants.delete(boardId);
      } else {
        this.participants.set(boardId, updatedParticipants);
      }
    }
  }

  public getParticipants(boardId: string): Participant[] | undefined {
    return this.participants.get(boardId);
  }

  private isParticipant(boardId: string, userId: string): boolean {
    const boardParticipants = this.participants.get(boardId);
    return boardParticipants?.some((p) => p.userId === userId) || false;
  }
}
