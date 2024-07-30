import subprocess
import unittest
import os

SRC_PATH = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SOL_PATH = os.path.join(SRC_PATH, "hello.sh")


class TestHelloCodeCup(unittest.TestCase):
    def _open(self, file_path):
        f = open(file_path)
        data = f.readlines()
        f.close()
        return data

    def _write_to_file(self, data, file_path):
        f = open(file_path, "w")
        f.write(data)
        f.close()

    def _give_access(self, file_path):
        command = 'chmod u+x ./' + file_path
        process = subprocess.Popen(
            command.split(), stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        output, error = process.communicate()

    def setUp(self):
        self.all = self._open(SOL_PATH)
        self.commands = []
        for line in self.all:
            line = line.strip()
            if line[-2:] == "\n":
                line = line[:-2]
            self.commands.append(line)

    def test_sample_first_word(self):
        # Printing which test it is
        self._give_access("hello.sh")
        # User Stage
        run_command_user = subprocess.Popen(
            ["sh", "./hello.sh", "6puCedoC"], stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        run_command_user.wait()
        output_user, error_user = run_command_user.communicate()
        # Assertions
        self.assertTrue("Hello CodeCup6!" in output_user.decode("UTF-8"))

    def test_sample_second_word(self):
        # Printing which test it is
        self._give_access("hello.sh")
        # User Stage
        run_command_user = subprocess.Popen(
            ["sh", "./hello.sh", "BilAS"], stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        run_command_user.wait()
        output_user, error_user = run_command_user.communicate()
        # Assertions
        self.assertTrue("Hello SAliB!" in output_user.decode("UTF-8"))

    def test_sample_third_word(self):
        # Printing which test it is
        self._give_access("hello.sh")
        # User Stage
        run_command_user = subprocess.Popen(
            ["sh", "./hello.sh", "areuQ"], stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        run_command_user.wait()
        output_user, error_user = run_command_user.communicate()
        # Assertions
        self.assertTrue("Hello Quera!" in output_user.decode("UTF-8"))

    def test_sample_fourth_word(self):
        # Printing which test it is
        self._give_access("hello.sh")
        # User Stage
        run_command_user = subprocess.Popen(
            ["sh", "./hello.sh", "XuniL"], stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        run_command_user.wait()
        output_user, error_user = run_command_user.communicate()
        # Assertions
        self.assertTrue("Hello LinuX!" in output_user.decode("UTF-8"))
