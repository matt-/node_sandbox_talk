#include <assert.h>
#include <stdio.h>

int main(int argc, char** argv) {

  FILE* file = fopen(argv[0], "r");
  assert(file != NULL);

  char c = fgetc(file);
  while (c != EOF) {
    int wrote = fputc(c, stdout);
    assert(wrote != EOF);
    c = fgetc(file);
  }
}