class Paciente {
    constructor(nome, cpf, endereco, tefone, plano, medico) {
        this.nome = nome;
        this.cpf = cpf;
        this.endereco = endereco;
        this.telefone = tefone;
        this.plano = plano;
        this.medico = medico;
    }
}

class Node {
    constructor(data, next = null) {
        this.data = data;
        this.next = next;
    }
}

class LinkedList {
    constructor() {
        this.head = null;
        this.count = 0;
    }

    insertFirst(data) {
        this.head = new Node(data, this.head);
        this.count++;
    }

    insertLast(data) {
        let node = new Node(data);
        let current;


        if (!this.head) {
            this.head = node;
        } else {
            current = this.head;


            while (current.next) {
                current = current.next;
            }


            current.next = node;
        }
        this.count++;
    }

    removeFirst() {
        if (!this.head) return;
        this.head = this.head.next;
        this.count--;
    }

    getFirstData() {
        if (!this.head) return;
        let value = this.head.data;
        this.removeFirst();
        return value;
    }

    removeLast() {
        if (!this.head) return;

        if (!this.head.next) {
            this.head = null;
            return;
        }

        let previous = this.head;
        let tail = this.head.next;

        while (tail.next) {
            previous = tail;
            tail = tail.next;
        }

        previous.next = null;
        this.count--;
    }

    printList() {
        let current = this.head;
        while (current) {
            console.log(current.data);
            current = current.next;
        }
    }

    searchByMedico(medico) {
        let current = this.head;
        let previous = null;
    
        while (current) {
            if (current.data.medico === medico) {
                if (previous) {
                    previous.next = current.next;
                } else {
                    this.head = current.next;
                }
                // Se o nó removido era o último, atualize o ponteiro de cauda
                if (current === this.tail) {
                    this.tail = previous;
                }
                this.count--;
                return current.data;
            }
            previous = current;
            current = current.next;
        }
        return null; // Retorna null se o médico não for encontrado
    }
}

module.exports = { Paciente, LinkedList};