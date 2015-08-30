;(function() {
  window.onload = function () {
    var editor = CodeMirror(document.getElementById("editor"), {
      value: '/* Write your solution here */',
      mode: "javascript"
    });

    var runTests = function runTests() {
      var tests = getTests();

      if (/\.should\./.test(tests)) chai.should();

      var code = eval('var userCode = function() { return ' + editor.getValue() + '; }; userCode()');
      var test = eval('var tests = function() { return ' + tests + '; }; tests();')

      var runTestsButton = document.getElementById("run-tests");
      try {
        test(code);

        console.log('All codes passed!');
        runTestsButton.classList.remove('blue');
        runTestsButton.classList.add('green');
      } catch (error) {
        console.warn('Tests failed: ', error);
        runTestsButton.classList.remove('blue');
        runTestsButton.classList.add('red');
      }
    }

    var runTestsButton = document.getElementById("run-tests");

    runTestsButton.addEventListener('click', runTests);

    window.runTests = runTests;
    window.editor = editor;
  }
})();
