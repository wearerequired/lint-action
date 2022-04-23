// Test header.

using System.Collections.Generic; // IMPORTS: Fix imports ordering
using System;

namespace dotnet.format;

class file2
{
    public static void Test()
    {
        var myList = new List<string>()
        {
                "Hello",
                "World"
        };

        foreach (var item in myList)
        {
            Console.WriteLine( item); // WHITESPACE: Fix whitespace formatting. Delete 1 characters.
        }
    }
}
