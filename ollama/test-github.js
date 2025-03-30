import { Octokit } from '@octokit/rest';

// Read token from environment variable
const token = process.env.GHPAT;

if (!token) {
    console.error('No GitHub token found in GHPAT environment variable');
    process.exit(1);
}

const octokit = new Octokit({
    auth: token
});

async function testGitHubAccess() {
    try {
        // Try to get the authenticated user's information
        const { data } = await octokit.rest.users.getAuthenticated();
        console.log('Successfully authenticated as:', data.login);
        console.log('Token is working correctly!');
        
        // Test repository access
        const repos = await octokit.rest.repos.listForAuthenticatedUser({
            per_page: 1
        });
        console.log('Successfully accessed repositories');
        console.log('First repository:', repos.data[0]?.full_name);
        
    } catch (error) {
        console.error('Error testing GitHub token:', error.message);
        process.exit(1);
    }
}

testGitHubAccess();

