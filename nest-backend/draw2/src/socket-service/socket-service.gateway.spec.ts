import { Test, TestingModule } from '@nestjs/testing';
import { SocketServiceGateway } from './socket-service.gateway';

describe('SocketServiceGateway', () => {
  let gateway: SocketServiceGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SocketServiceGateway],
    }).compile();

    gateway = module.get<SocketServiceGateway>(SocketServiceGateway);
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });
});
