interface GitHubGPGKey {
  raw_key: string;
  key_id: string;
}

export async function fetchGitHubGPGKeys(username: string): Promise<string[]> {
  if (!username?.trim()) {
    throw new Error('GitHub username is required');
  }

  try {
    const response = await fetch(`https://api.github.com/users/${username}/gpg_keys`, {
      headers: {
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'GPG-Tool'
      }
    });
    
    if (!response.ok) {
      switch (response.status) {
        case 404:
          throw new Error(`GitHub user '${username}' not found`);
        case 403:
          throw new Error('GitHub API rate limit exceeded. Please try again later.');
        case 401:
          throw new Error('GitHub API authentication failed');
        default:
          throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
      }
    }

    const keys = await response.json() as GitHubGPGKey[];
    
    if (!Array.isArray(keys)) {
      throw new Error('Invalid response format from GitHub API');
    }

    if (keys.length === 0) {
      throw new Error(`No GPG keys found for GitHub user '${username}'. The user must have GPG keys published on their GitHub profile.`);
    }

    return keys.map((key) => {
      if (!key.raw_key) {
        throw new Error('Invalid GPG key format in GitHub response');
      }
      return key.raw_key;
    });
  } catch (error) {
    if (error instanceof Error) {
      console.error('Error fetching GPG keys:', error.message);
      throw error;
    }
    console.error('Error fetching GPG keys:', error);
    throw new Error('An unexpected error occurred while fetching GPG keys');
  }
}