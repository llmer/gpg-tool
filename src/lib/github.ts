export async function fetchGitHubGPGKeys(username: string): Promise<string[]> {
  try {
    const response = await fetch(`https://api.github.com/users/${username}/gpg_keys`);
    
    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('GitHub user not found');
      }
      if (response.status === 403) {
        throw new Error('GitHub API rate limit exceeded. Please try again later.');
      }
      throw new Error(`GitHub API error: ${response.statusText}`);
    }

    const keys = await response.json();
    
    if (!Array.isArray(keys)) {
      throw new Error('Invalid response from GitHub API');
    }

    if (keys.length === 0) {
      throw new Error('No GPG keys found for this GitHub user');
    }

    return keys.map((key: { raw_key: string }) => {
      if (!key.raw_key) {
        throw new Error('Invalid GPG key format received from GitHub');
      }
      return key.raw_key;
    });
  } catch (error) {
    console.error('Error fetching GPG keys:', error);
    if (error instanceof Error) {
      throw new Error(`Failed to fetch GPG keys: ${error.message}`);
    }
    throw new Error('Failed to fetch GPG keys: Unknown error occurred');
  }
}