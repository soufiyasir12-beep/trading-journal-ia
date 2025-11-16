-- Community Features Migration
-- Creates tables for forum, profiles, posts, comments, follows, notifications, and votes

-- ============================================
-- PROFILES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username VARCHAR(50) UNIQUE NOT NULL,
  bio TEXT,
  avatar_url TEXT,
  trading_style_tags TEXT[], -- Array of trading style tags (e.g., ['scalping', 'swing', 'day-trading'])
  role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('user', 'pro_trader', 'moderator')),
  followers_count INTEGER DEFAULT 0,
  following_count INTEGER DEFAULT 0,
  posts_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- ============================================
-- POSTS TABLE (Threads)
-- ============================================
CREATE TABLE IF NOT EXISTS public.posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category VARCHAR(50) NOT NULL CHECK (category IN ('strategies', 'psychology', 'performance', 'funding_challenges')),
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  upvotes INTEGER DEFAULT 0,
  downvotes INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  is_pinned BOOLEAN DEFAULT false,
  is_locked BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- ============================================
-- COMMENTS TABLE (with nested replies)
-- ============================================
CREATE TABLE IF NOT EXISTS public.comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES public.comments(id) ON DELETE CASCADE, -- For nested replies
  content TEXT NOT NULL,
  upvotes INTEGER DEFAULT 0,
  downvotes INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- ============================================
-- VOTES TABLE (for posts and comments)
-- ============================================
CREATE TABLE IF NOT EXISTS public.votes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE,
  comment_id UUID REFERENCES public.comments(id) ON DELETE CASCADE,
  vote_type VARCHAR(10) NOT NULL CHECK (vote_type IN ('upvote', 'downvote')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  -- Ensure user can only vote once per post/comment
  CONSTRAINT votes_check CHECK (
    (post_id IS NOT NULL AND comment_id IS NULL) OR
    (post_id IS NULL AND comment_id IS NOT NULL)
  ),
  UNIQUE(user_id, post_id),
  UNIQUE(user_id, comment_id)
);

-- ============================================
-- FOLLOWS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.follows (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  follower_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  following_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  UNIQUE(follower_id, following_id),
  CHECK (follower_id != following_id) -- Can't follow yourself
);

-- ============================================
-- NOTIFICATIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL CHECK (type IN (
    'post_reply',
    'comment_reply',
    'post_upvote',
    'comment_upvote',
    'new_follower',
    'post_mention',
    'comment_mention'
  )),
  related_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  related_post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE,
  related_comment_id UUID REFERENCES public.comments(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- ============================================
-- INDEXES
-- ============================================
-- Profiles indexes
CREATE INDEX IF NOT EXISTS idx_profiles_username ON public.profiles(username);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);

-- Posts indexes
CREATE INDEX IF NOT EXISTS idx_posts_user_id ON public.posts(user_id);
CREATE INDEX IF NOT EXISTS idx_posts_category ON public.posts(category);
CREATE INDEX IF NOT EXISTS idx_posts_created ON public.posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_pinned ON public.posts(is_pinned DESC, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_category_created ON public.posts(category, created_at DESC);

-- Comments indexes
CREATE INDEX IF NOT EXISTS idx_comments_post_id ON public.comments(post_id);
CREATE INDEX IF NOT EXISTS idx_comments_user_id ON public.comments(user_id);
CREATE INDEX IF NOT EXISTS idx_comments_parent_id ON public.comments(parent_id);
CREATE INDEX IF NOT EXISTS idx_comments_created ON public.comments(created_at ASC);

-- Votes indexes
CREATE INDEX IF NOT EXISTS idx_votes_post_id ON public.votes(post_id);
CREATE INDEX IF NOT EXISTS idx_votes_comment_id ON public.votes(comment_id);
CREATE INDEX IF NOT EXISTS idx_votes_user_id ON public.votes(user_id);

-- Follows indexes
CREATE INDEX IF NOT EXISTS idx_follows_follower ON public.follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_follows_following ON public.follows(following_id);

-- Notifications indexes
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON public.notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created ON public.notifications(created_at DESC);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- ============================================
-- PROFILES POLICIES
-- ============================================
-- Anyone can view profiles
CREATE POLICY "Anyone can view profiles"
  ON public.profiles FOR SELECT
  TO public
  USING (true);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- Users can insert their own profile
CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- ============================================
-- POSTS POLICIES
-- ============================================
-- Anyone can view posts
CREATE POLICY "Anyone can view posts"
  ON public.posts FOR SELECT
  TO public
  USING (true);

-- Authenticated users can create posts
CREATE POLICY "Authenticated users can create posts"
  ON public.posts FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own posts, moderators can update any
CREATE POLICY "Users can update own posts or moderators can update any"
  ON public.posts FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = user_id OR
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'moderator')
  );

-- Users can delete their own posts, moderators can delete any
CREATE POLICY "Users can delete own posts or moderators can delete any"
  ON public.posts FOR DELETE
  TO authenticated
  USING (
    auth.uid() = user_id OR
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'moderator')
  );

-- ============================================
-- COMMENTS POLICIES
-- ============================================
-- Anyone can view comments
CREATE POLICY "Anyone can view comments"
  ON public.comments FOR SELECT
  TO public
  USING (true);

-- Authenticated users can create comments
CREATE POLICY "Authenticated users can create comments"
  ON public.comments FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own comments, moderators can update any
CREATE POLICY "Users can update own comments or moderators can update any"
  ON public.comments FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = user_id OR
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'moderator')
  );

-- Users can delete their own comments, moderators can delete any
CREATE POLICY "Users can delete own comments or moderators can delete any"
  ON public.comments FOR DELETE
  TO authenticated
  USING (
    auth.uid() = user_id OR
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'moderator')
  );

-- ============================================
-- VOTES POLICIES
-- ============================================
-- Anyone can view votes
CREATE POLICY "Anyone can view votes"
  ON public.votes FOR SELECT
  TO public
  USING (true);

-- Authenticated users can create/update votes
CREATE POLICY "Authenticated users can vote"
  ON public.votes FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============================================
-- FOLLOWS POLICIES
-- ============================================
-- Anyone can view follows
CREATE POLICY "Anyone can view follows"
  ON public.follows FOR SELECT
  TO public
  USING (true);

-- Authenticated users can follow/unfollow
CREATE POLICY "Authenticated users can follow"
  ON public.follows FOR ALL
  TO authenticated
  USING (auth.uid() = follower_id)
  WITH CHECK (auth.uid() = follower_id);

-- ============================================
-- NOTIFICATIONS POLICIES
-- ============================================
-- Users can only view their own notifications
CREATE POLICY "Users can view own notifications"
  ON public.notifications FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- System can create notifications (via service role)
-- Users can update their own notifications (mark as read)
CREATE POLICY "Users can update own notifications"
  ON public.notifications FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc', NOW());
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_posts_updated_at
  BEFORE UPDATE ON public.posts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_comments_updated_at
  BEFORE UPDATE ON public.comments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to update post comments_count
CREATE OR REPLACE FUNCTION update_post_comments_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.posts
    SET comments_count = comments_count + 1
    WHERE id = NEW.post_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.posts
    SET comments_count = GREATEST(comments_count - 1, 0)
    WHERE id = OLD.post_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ language 'plpgsql';

-- Trigger for comments_count
CREATE TRIGGER update_post_comments_count_trigger
  AFTER INSERT OR DELETE ON public.comments
  FOR EACH ROW
  EXECUTE FUNCTION update_post_comments_count();

-- Function to update vote counts on posts
CREATE OR REPLACE FUNCTION update_post_vote_counts()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Only update if this vote is for a post (not a comment)
    IF NEW.post_id IS NOT NULL THEN
      IF NEW.vote_type = 'upvote' THEN
        UPDATE public.posts SET upvotes = upvotes + 1 WHERE id = NEW.post_id;
      ELSE
        UPDATE public.posts SET downvotes = downvotes + 1 WHERE id = NEW.post_id;
      END IF;
    END IF;
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    -- Only update if this vote is for a post (not a comment)
    IF NEW.post_id IS NOT NULL THEN
      -- Handle vote change (upvote to downvote or vice versa)
      IF OLD.vote_type = 'upvote' AND NEW.vote_type = 'downvote' THEN
        UPDATE public.posts SET upvotes = GREATEST(upvotes - 1, 0), downvotes = downvotes + 1 WHERE id = NEW.post_id;
      ELSIF OLD.vote_type = 'downvote' AND NEW.vote_type = 'upvote' THEN
        UPDATE public.posts SET downvotes = GREATEST(downvotes - 1, 0), upvotes = upvotes + 1 WHERE id = NEW.post_id;
      END IF;
    END IF;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    -- Only update if this vote was for a post (not a comment)
    IF OLD.post_id IS NOT NULL THEN
      IF OLD.vote_type = 'upvote' THEN
        UPDATE public.posts SET upvotes = GREATEST(upvotes - 1, 0) WHERE id = OLD.post_id;
      ELSE
        UPDATE public.posts SET downvotes = GREATEST(downvotes - 1, 0) WHERE id = OLD.post_id;
      END IF;
    END IF;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ language 'plpgsql';

-- Trigger for post vote counts
CREATE TRIGGER update_post_vote_counts_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.votes
  FOR EACH ROW
  EXECUTE FUNCTION update_post_vote_counts();

-- Function to update vote counts on comments
CREATE OR REPLACE FUNCTION update_comment_vote_counts()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Only update if this vote is for a comment (not a post)
    IF NEW.comment_id IS NOT NULL THEN
      IF NEW.vote_type = 'upvote' THEN
        UPDATE public.comments SET upvotes = upvotes + 1 WHERE id = NEW.comment_id;
      ELSE
        UPDATE public.comments SET downvotes = downvotes + 1 WHERE id = NEW.comment_id;
      END IF;
    END IF;
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    -- Only update if this vote is for a comment (not a post)
    IF NEW.comment_id IS NOT NULL THEN
      IF OLD.vote_type = 'upvote' AND NEW.vote_type = 'downvote' THEN
        UPDATE public.comments SET upvotes = GREATEST(upvotes - 1, 0), downvotes = downvotes + 1 WHERE id = NEW.comment_id;
      ELSIF OLD.vote_type = 'downvote' AND NEW.vote_type = 'upvote' THEN
        UPDATE public.comments SET downvotes = GREATEST(downvotes - 1, 0), upvotes = upvotes + 1 WHERE id = NEW.comment_id;
      END IF;
    END IF;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    -- Only update if this vote was for a comment (not a post)
    IF OLD.comment_id IS NOT NULL THEN
      IF OLD.vote_type = 'upvote' THEN
        UPDATE public.comments SET upvotes = GREATEST(upvotes - 1, 0) WHERE id = OLD.comment_id;
      ELSE
        UPDATE public.comments SET downvotes = GREATEST(downvotes - 1, 0) WHERE id = OLD.comment_id;
      END IF;
    END IF;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ language 'plpgsql';

-- Trigger for comment vote counts
CREATE TRIGGER update_comment_vote_counts_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.votes
  FOR EACH ROW
  EXECUTE FUNCTION update_comment_vote_counts();

-- Function to update follow counts
CREATE OR REPLACE FUNCTION update_follow_counts()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.profiles SET followers_count = followers_count + 1 WHERE id = NEW.following_id;
    UPDATE public.profiles SET following_count = following_count + 1 WHERE id = NEW.follower_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.profiles SET followers_count = GREATEST(followers_count - 1, 0) WHERE id = OLD.following_id;
    UPDATE public.profiles SET following_count = GREATEST(following_count - 1, 0) WHERE id = OLD.follower_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ language 'plpgsql';

-- Trigger for follow counts
CREATE TRIGGER update_follow_counts_trigger
  AFTER INSERT OR DELETE ON public.follows
  FOR EACH ROW
  EXECUTE FUNCTION update_follow_counts();

-- Function to update posts_count on profiles
CREATE OR REPLACE FUNCTION update_profile_posts_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.profiles SET posts_count = posts_count + 1 WHERE id = NEW.user_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.profiles SET posts_count = GREATEST(posts_count - 1, 0) WHERE id = OLD.user_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ language 'plpgsql';

-- Trigger for posts_count
CREATE TRIGGER update_profile_posts_count_trigger
  AFTER INSERT OR DELETE ON public.posts
  FOR EACH ROW
  EXECUTE FUNCTION update_profile_posts_count();

-- Function to create notification on comment reply
CREATE OR REPLACE FUNCTION notify_comment_reply()
RETURNS TRIGGER AS $$
DECLARE
  post_author_id UUID;
  parent_comment_user_id UUID;
BEGIN
  -- Get post author
  SELECT user_id INTO post_author_id FROM public.posts WHERE id = NEW.post_id;
  
  -- If this is a reply to a comment, get the parent comment author
  IF NEW.parent_id IS NOT NULL THEN
    SELECT user_id INTO parent_comment_user_id FROM public.comments WHERE id = NEW.parent_id;
    
    -- Notify parent comment author (if not the same as the commenter)
    IF parent_comment_user_id IS NOT NULL AND parent_comment_user_id != NEW.user_id THEN
      INSERT INTO public.notifications (user_id, type, related_user_id, related_post_id, related_comment_id, message)
      VALUES (
        parent_comment_user_id,
        'comment_reply',
        NEW.user_id,
        NEW.post_id,
        NEW.id,
        'Someone replied to your comment'
      );
    END IF;
  END IF;
  
  -- Notify post author if comment is not from them and not a reply to another comment
  IF post_author_id IS NOT NULL AND post_author_id != NEW.user_id AND NEW.parent_id IS NULL THEN
    INSERT INTO public.notifications (user_id, type, related_user_id, related_post_id, related_comment_id, message)
    VALUES (
      post_author_id,
      'post_reply',
      NEW.user_id,
      NEW.post_id,
      NEW.id,
      'Someone commented on your post'
    );
  END IF;
  
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for comment notifications
CREATE TRIGGER notify_comment_reply_trigger
  AFTER INSERT ON public.comments
  FOR EACH ROW
  EXECUTE FUNCTION notify_comment_reply();

-- Function to create notification on new follower
CREATE OR REPLACE FUNCTION notify_new_follower()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.notifications (user_id, type, related_user_id, message)
  VALUES (
    NEW.following_id,
    'new_follower',
    NEW.follower_id,
    'Someone started following you'
  );
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for new follower notifications
CREATE TRIGGER notify_new_follower_trigger
  AFTER INSERT ON public.follows
  FOR EACH ROW
  EXECUTE FUNCTION notify_new_follower();

-- Grant necessary permissions
GRANT SELECT ON public.profiles TO anon, authenticated;
GRANT SELECT ON public.posts TO anon, authenticated;
GRANT SELECT ON public.comments TO anon, authenticated;
GRANT SELECT ON public.votes TO anon, authenticated;
GRANT SELECT ON public.follows TO anon, authenticated;
GRANT SELECT ON public.notifications TO authenticated;

