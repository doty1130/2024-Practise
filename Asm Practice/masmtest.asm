; adding two ints 
; William Doty

.386 ; for 32 bit masm, it enables instuctions for 80386 and 80387 processors.
.model flat, stdcall ; model flat directive to provide access to the 32 bit instructions and register available in the processor.
.stack 4096 ; .stack directive tells the assembler to reserve 4096 bytes of uninitialed storage

ExitProcess Proto, dwExitCode:dword ; exit prototype

.data ; data driective identifies the area of the program containig variables. this might be like the Data segment from the intel project.

sum DWORD ? ; in this code the sum is a variables and the DWORD is a directive, the ? means that it is not initialized and if we want to read it, we must first right to it.

.code ; the code directive, this the is the begining of the program and the area of a program that holds the containing instructions 
main proc ; begining of main procedure
    mov eax, 7 ; move 7 to register eax
    add eax, 4 ; add 4 to register eax
    mov sum, eax ; moves eax into sum variable.

    invoke ExitProcess, 0

main endp
end main