/** Jest stub — avoids loading OpenAI SDK in unit tests. */
class OpenAIEmbeddingProvider {
  async embed({ input }) {
    const texts = Array.isArray(input) ? input : [input];
    return {
      embeddings: texts.map(() => []),
      usage: { totalTokens: 0 },
    };
  }
}

module.exports = { OpenAIEmbeddingProvider };
