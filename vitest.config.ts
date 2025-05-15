export default {
  test: {
    mockReset: true,
    coverage: {
      reporter: ['text'],
      include: ['src/**/*.ts'],
      exclude: ['src/**/*.{schema,mock,types,error,const}.ts', 'src/**/index.ts'],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 80,
        statements: 80,
      },
    },
  },
};
