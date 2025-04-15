import { Test, TestingModule } from '@nestjs/testing';
import { BoardObjectService } from './board-object.service';

describe('BoardObjectService', () => {
  let service: BoardObjectService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BoardObjectService],
    }).compile();

    service = module.get<BoardObjectService>(BoardObjectService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
