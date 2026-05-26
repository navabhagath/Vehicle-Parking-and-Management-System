import { TestBed } from '@angular/core/testing';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { of } from 'rxjs';
import { ModalService } from './modal.service';

describe('ModalService', () => {
  let service: ModalService;
  let dialogSpy: jasmine.SpyObj<MatDialog>;

  beforeEach(() => {
    const mockDialogRef = {
      afterClosed: () => of(true),
    } as unknown as MatDialogRef<any>;
    dialogSpy = jasmine.createSpyObj('MatDialog', ['open']);
    dialogSpy.open.and.returnValue(mockDialogRef);

    TestBed.configureTestingModule({
      providers: [{ provide: MatDialog, useValue: dialogSpy }],
    });
    service = TestBed.inject(ModalService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should open dialog and return true when confirmed', async () => {
    const result = await service.confirm({ title: 'Test', message: 'Sure?' });
    expect(dialogSpy.open).toHaveBeenCalled();
    expect(result).toBeTrue();
  });

  it('should return false when dialog is dismissed', async () => {
    const mockDialogRef = {
      afterClosed: () => of(false),
    } as unknown as MatDialogRef<any>;
    dialogSpy.open.and.returnValue(mockDialogRef);
    const result = await service.confirm({});
    expect(result).toBeFalse();
  });

  it('should return false when dialog returns undefined', async () => {
    const mockDialogRef = {
      afterClosed: () => of(undefined),
    } as unknown as MatDialogRef<any>;
    dialogSpy.open.and.returnValue(mockDialogRef);
    const result = await service.confirm({});
    expect(result).toBeFalse();
  });
});
