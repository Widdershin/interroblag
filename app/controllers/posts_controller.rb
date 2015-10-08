class PostsController < ApplicationController
  protect_from_forgery except: :update

  def index
    @posts = Post.all

    respond_to do |format|
      format.html
      format.json { render json: @posts }
    end
  end

  def update
    post = Post.find(params[:id])

    post.update_attributes!(post_update_attributes)

    render json: {success: true}
  end

  private

  def post_update_attributes
    params.require(:post).permit(:id, :title, :content, :x, :y)
  end
end
