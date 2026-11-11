import {it,expect} from 'vitest';
import {uploadKind,MAX_UPLOAD} from '../src/features/uploads/validate';
it('rejects executable content, spoofed MIME and oversized uploads',()=>{expect(()=>uploadKind(new TextEncoder().encode('<svg onload="alert(1)"/>'),'image/svg+xml')).toThrow();expect(()=>uploadKind(new Uint8Array([137,80,78,71,13,10,26,10]),'image/jpeg')).toThrow();expect(()=>uploadKind(new Uint8Array(MAX_UPLOAD+1),'image/png')).toThrow();expect(uploadKind(new Uint8Array([137,80,78,71,13,10,26,10]),'image/png').extension).toBe('png')});
