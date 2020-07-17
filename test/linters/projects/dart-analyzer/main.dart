import 'ignore_analyzer.dart';

void main() {
  var another_unused_var = ''; // ignore: unused_local_variable
  var unused_var = '';
  decrement();
}

void increment(int count) {
  if (count < 10) ;
  _count++;
}

@Deprecated('dont use it')
void decrement() {
  print('deprecated');
}
