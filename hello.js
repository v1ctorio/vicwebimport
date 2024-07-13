class test {
  constructor() {
    console.log('test');
    this.chat = 'vicequisd';
  }
  hello() {
    console.log('hello');
  }
  
}

const a = new test();

console.log(JSON.stringify(a));