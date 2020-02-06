from file2 import helper


def main(input_str: str):
    print(input_str)
    print(helper({
        input_str: 42,
    }))


main(["hello"])
