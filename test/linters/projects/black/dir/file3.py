def add(num_1, num_2):


    return num_1 + num_2  # Blank line error


def mean(items ):  # Extra whitespace
    return sum(items) / len(items)


def median(items ):
    total = len(items)
    mid = total//2
    expected_mid = total/2

    if mid == expected_mid :
        return sorted(items)[mid]

    raise ValueError(
        'Items need to contain a middle item.'  # Black comma for hanging indent.
    )
